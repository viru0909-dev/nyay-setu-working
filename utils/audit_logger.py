import json
import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime, timezone
from flask import request, current_app
from threading import Thread

# 6. Optional (Bonus - Production Ready)
# Move log file path to .env
AUDIT_LOG_PATH = os.getenv("AUDIT_LOG_PATH", "/var/log/judicial-audit.log")

# Setup a dedicated logger for audit events
audit_file_logger = logging.getLogger("audit_logger")
audit_file_logger.setLevel(logging.INFO)

try:
    # Use RotatingFileHandler to manage file sizes (10MB max, keep 5 backups)
    handler = RotatingFileHandler(AUDIT_LOG_PATH, maxBytes=10*1024*1024, backupCount=5)
    # The format should just be the raw message (which will be JSON)
    handler.setFormatter(logging.Formatter('%(message)s'))
    audit_file_logger.addHandler(handler)
except Exception as e:
    logging.error(f"Failed to initialize file audit logger at {AUDIT_LOG_PATH}: {e}")

def log_document_access(user_id, document_id, action):
    """
    Logs document access events asynchronously to avoid blocking the main request thread.
    """
    try:
        # Capture request-context specific data before passing to thread
        # The thread won't have access to Flask's request context
        ip_address = request.remote_addr if request else "Unknown"
        user_agent = request.headers.get("User-Agent") if request else "Unknown"
        
        # Use timezone-aware UTC datetime for compliance
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Ensure all IDs are strings and build the log entry
        audit_log = {
            "user_id": str(user_id),
            "document_id": str(document_id),
            "action": action,
            "timestamp": timestamp,
            "ip_address": ip_address,
            "user_agent": user_agent
        }

        # Make async logging configurable
        use_async = current_app.config.get("ASYNC_AUDIT_LOGGING", True)
        
        if use_async:
            # Pass actual app object so the thread can push app context
            app_context = current_app._get_current_object()
            Thread(target=_write_audit_log, args=(app_context, audit_log,)).start()
        else:
            _write_audit_log(current_app._get_current_object(), audit_log)
            
    except Exception as e:
        # 5. Error Handling: Must not crash request
        logging.error(f"Failed to trigger audit log for document {document_id}: {e}")

def _write_audit_log(app, audit_log):
    """
    Writes the audit log to MongoDB and the file system.
    """
    # 1. MongoDB Logging
    try:
        with app.app_context():
            db = app.config.get("MONGO_DB")
            if db is not None:
                # Insert a copy so Mongo's inserted _id doesn't mutate the dictionary 
                db.audit_logs.insert_one(audit_log.copy())
            else:
                logging.error("MongoDB audit logging failed: MONGO_DB not found in app config")
    except Exception as e:
        # 5. Error Handling: log error but continue request
        logging.error(f"MongoDB audit logging failed: {e}")

    # 2. File Logging
    try:
        # Ensure it's append-only via the RotatingFileHandler configuration
        audit_file_logger.info(json.dumps(audit_log))
    except Exception as e:
        # 5. Error Handling: log error but continue request, handle permission errors
        logging.error(f"File audit logging failed: {e}")
