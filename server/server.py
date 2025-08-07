from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

SCORE_FILE = 'scores.json'

def load_scores():
    if os.path.exists(SCORE_FILE):
        with open(SCORE_FILE, 'r') as f:
            return json.load(f)
    return []

def save_scores(scores):
    with open(SCORE_FILE, 'w') as f:
        json.dump(scores, f)

@app.route('/scores', methods=['GET'])
def get_scores():
    scores = load_scores()
    return jsonify(scores)


@app.route('/scores', methods=['POST'])
def post_score():
    data = request.get_json()
    if 'name' in data and 'score' in data:
        scores = load_scores()
        updated = False

        for entry in scores:
            if entry['name'] == data['name']:
                if data['score'] > entry['score']:
                    entry['score'] = data['score']
                    updated = True
                break
        else:
            scores.append({'name': data['name'], 'score': data['score']})
            updated = True

        if updated:
            scores.sort(key=lambda x: x['score'], reverse=True)
            save_scores(scores)
            return 'Score saved', 201
        else:
            return 'Score not higher than existing', 200

    return 'Invalid data', 400


if __name__ == '__main__':
    from flask import cli
    cli.show_server_banner = lambda *x: None 
    app.run(host='0.0.0.0', port=5000)
