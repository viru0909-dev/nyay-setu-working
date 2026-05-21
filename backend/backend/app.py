from flask import Flask, request, jsonify
from predictor import predict_case_progress, predict_next_hearing

app = Flask(__name__)

@app.route('/predict-case', methods=['POST'])
def predict_case():
    data = request.json

    hearings = int(data['hearings'])
    last_date = data['last_hearing_date']

    return jsonify({
        "case_progress": predict_case_progress(hearings),
        "next_hearing_date": predict_next_hearing(last_date)
    })

if __name__ == "__main__":
    app.run(debug=True)
