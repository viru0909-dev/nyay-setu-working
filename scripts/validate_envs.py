import os
import re
import sys

# Directory configuration relative to repo root
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Env template configurations
TEMPLATES = {
    "root": os.path.join(ROOT_DIR, ".env.example"),
    "backend": os.path.join(ROOT_DIR, "backend", "nyaysetu-backend", ".env.example"),
    "nlp": os.path.join(ROOT_DIR, "nlp-orchestrator", ".env.example"),
    "lawgpt": os.path.join(ROOT_DIR, "lawgpt-service", ".env.example"),
}

# Scan directories and search configurations
MODULES = [
    {
        "name": "Backend (Java)",
        "scan_dirs": [os.path.join(ROOT_DIR, "backend", "nyaysetu-backend", "src")],
        "file_patterns": [r".*\.java$", r".*\.properties$"],
        "regexes": [
            r"System\.getenv\(\s*[\"\']([A-Za-z0-9_]+)[\"\']",
            r"\$\{([A-Za-z0-9_]+)(?::[^}]*)?\}",
        ],
        "template_keys": ["backend", "root"],
    },
    {
        "name": "NLP Orchestrator (Python)",
        "scan_dirs": [os.path.join(ROOT_DIR, "nlp-orchestrator")],
        "file_patterns": [r".*\.py$"],
        "regexes": [
            r"(?:os\.getenv|os\.environ\.get)\(\s*[\"\']([A-Za-z0-9_]+)[\"\']",
            r"os\.environ\[\s*[\"\']([A-Za-z0-9_]+)[\"\']",
        ],
        "template_keys": ["nlp", "root"],
    },
    {
        "name": "LawGPT Service (Python)",
        "scan_dirs": [os.path.join(ROOT_DIR, "lawgpt-service")],
        "file_patterns": [r".*\.py$"],
        "regexes": [
            r"(?:os\.getenv|os\.environ\.get)\(\s*[\"\']([A-Za-z0-9_]+)[\"\']",
            r"os\.environ\[\s*[\"\']([A-Za-z0-9_]+)[\"\']",
        ],
        "template_keys": ["lawgpt", "root"],
    },
    {
        "name": "Frontend (Vite)",
        "scan_dirs": [
            os.path.join(ROOT_DIR, "frontend", "nyaysetu-frontend", "src"),
            os.path.join(ROOT_DIR, "frontend", "nyaysetu-frontend"),
        ],
        "file_patterns": [r".*\.jsx?$", r".*\.tsx?$", r".*\.html$", r".*\.config\.js$"],
        "regexes": [
            r"import\.meta\.env\.([A-Za-z0-9_]+)",
            r"process\.env\.([A-Za-z0-9_]+)",
        ],
        "template_keys": ["root"],  # Frontend shares root .env.example
    },
]

# Standard env vars to ignore from scanning
EXCLUDED_KEYS = {
    # System & Standard env vars
    "PORT", "ENV", "MODE", "DEV", "PROD", "SSR", "BASE_URL", "PATH", "TEMP", "TMP",
    "NODE_ENV", "USER", "HOME", "HOSTNAME", "SHELL",
    # Specific framework variables
    "VITE_USER_NODE_ENV",
}


def parse_env_example(filepath):
    """Parse env keys from a .env.example file."""
    keys = set()
    if not os.path.exists(filepath):
        print(f"Warning: Template file not found: {filepath}")
        return keys
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key = line.split("=")[0].strip()
                if key:
                    keys.add(key)
    return keys


def scan_module_for_keys(module_config):
    """Scan the module directory for accessed environment variable keys."""
    used_keys = set()
    regex_compiled = [re.compile(r) for r in module_config["regexes"]]
    file_patterns = [re.compile(p) for p in module_config["file_patterns"]]

    for scan_dir in module_config["scan_dirs"]:
        if not os.path.exists(scan_dir):
            continue
        for root, _, files in os.walk(scan_dir):
            # Skip node_modules, .git, venv, target, __pycache__, etc.
            if any(p in root for p in ["node_modules", ".git", "venv", "target", "__pycache__"]):
                continue
            for file in files:
                # Check if file matches pattern
                if not any(pattern.match(file) for pattern in file_patterns):
                    continue
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        for line in f:
                            for r in regex_compiled:
                                matches = r.findall(line)
                                for match in matches:
                                    if match not in EXCLUDED_KEYS:
                                        used_keys.add(match)
                except Exception as e:
                    print(f"Could not read file {file_path}: {e}")
    return used_keys


def main():
    print("Parsing .env.example templates...")
    templates_parsed = {name: parse_env_example(path) for name, path in TEMPLATES.items()}
    
    for name, keys in templates_parsed.items():
        print(f"  * {name} ({TEMPLATES[name]}): {len(keys)} keys found")

    mismatch_found = False

    print("\nScanning codebase modules for environment variables...")
    for mod in MODULES:
        print(f"\nScanning: {mod['name']}...")
        used_keys = scan_module_for_keys(mod)
        print(f"  * Found {len(used_keys)} unique env keys referenced in code.")

        # Combine allowed templates for this module
        allowed_keys = set()
        for tkey in mod["template_keys"]:
            allowed_keys.update(templates_parsed[tkey])

        # Find missing keys
        missing_keys = used_keys - allowed_keys
        
        # Some custom project handling/exclusions:
        # If GOOGLE_GEMINI_API_KEY is defined in template, allow GEMINI_API_KEY in code (alias)
        if "GEMINI_API_KEY" in missing_keys and "GOOGLE_GEMINI_API_KEY" in allowed_keys:
            missing_keys.remove("GEMINI_API_KEY")
        # If REACT_APP_API_URL or REACT_APP_API_BASE_URL are checked in code but VITE_API_URL exists
        if "REACT_APP_API_URL" in missing_keys and "REACT_APP_API_BASE_URL" in allowed_keys:
            missing_keys.remove("REACT_APP_API_URL")

        if missing_keys:
            print(f"  [ERROR] Mismatches found! The following keys are used in code but missing from .env.example:")
            for key in sorted(missing_keys):
                print(f"    - {key}")
            mismatch_found = True
        else:
            print(f"  [OK] Validation passed! All code env keys are documented in templates.")

    if mismatch_found:
        print("\n[FAILED] Environment variable validation failed. Please update your .env.example files.")
        sys.exit(1)
    else:
        print("\n[SUCCESS] Environment variable validation completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
