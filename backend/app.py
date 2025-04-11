from flask import Flask, request, jsonify
from services.audio_service import AudioService
from services.game_service import GameService

app = Flask(__name__)

audio_service = AudioService()
game_service = GameService()

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        audio_service.process_audio(file)
        return jsonify({"message": "File uploaded and processed successfully."}), 200
    return jsonify({"error": "No file provided."}), 400

@app.route('/split', methods=['POST'])
def split_audio():
    data = request.json
    audio_file = data.get('audio_file')
    ranges = data.get('ranges')
    if audio_file and ranges:
        split_parts = audio_service.split_audio(audio_file, ranges)
        return jsonify({"split_parts": split_parts}), 200
    return jsonify({"error": "Invalid input."}), 400

@app.route('/start-game', methods=['POST'])
def start_game():
    game_id = game_service.start_new_game()
    return jsonify({"game_id": game_id}), 200

@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    data = request.json
    game_id = data.get('game_id')
    answer = data.get('answer')
    score = game_service.submit_answer(game_id, answer)
    return jsonify({"score": score}), 200

if __name__ == '__main__':
    app.run(debug=True)