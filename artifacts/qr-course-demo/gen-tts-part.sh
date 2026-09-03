curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "Want to become a PhD in evolutionary psychology? That'\''s a long road, but here is the place to start... EvoPsych dot X Y Z.",
    "voice": "echo"
  }' \
  --output artifacts/qr-course-demo/public/voice_part1.mp3
