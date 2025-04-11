from flask import jsonify

class GameService:
    def __init__(self):
        self.scores = {}
        self.current_game = None

    def start_game(self, user_id):
        self.current_game = {
            'user_id': user_id,
            'score': 0,
            'attempts': 0
        }
        return jsonify({"message": "Game started", "user_id": user_id})

    def submit_answer(self, user_id, answer):
        if self.current_game and self.current_game['user_id'] == user_id:
            self.current_game['attempts'] += 1
            # Logic to check the answer and update score
            if self.check_answer(answer):
                self.current_game['score'] += 1
                return jsonify({"message": "Correct!", "score": self.current_game['score']})
            else:
                return jsonify({"message": "Incorrect!", "score": self.current_game['score']})
        return jsonify({"message": "No active game for this user."})

    def check_answer(self, answer):
        # Placeholder for actual answer checking logic
        return answer == "correct_answer"  # Replace with actual logic

    def end_game(self, user_id):
        if self.current_game and self.current_game['user_id'] == user_id:
            final_score = self.current_game['score']
            self.current_game = None
            return jsonify({"message": "Game ended", "final_score": final_score})
        return jsonify({"message": "No active game for this user."})