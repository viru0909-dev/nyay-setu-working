from datetime import datetime, timedelta

def predict_case_progress(hearings_completed):
    if hearings_completed <= 2:
        return "Early Stage (20–30%)"
    elif hearings_completed <= 5:
        return "Mid Stage (40–70%)"
    else:
        return "Final Stage (80–95%)"


def predict_next_hearing(last_hearing_date):
    date_obj = datetime.strptime(last_hearing_date, "%Y-%m-%d")
    return (date_obj + timedelta(days=30)).strftime("%Y-%m-%d")
