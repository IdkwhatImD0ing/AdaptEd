# TeachMe

What you'll need to run the frontend:

- [Bun](https://bun.sh/)

What you'll need to run the server:

- [Python >3.10](https://www.python.org/)
- [Pip](https://pypi.org/project/pip/)
- [Uvicorn](https://www.uvicorn.org/)
- [Ngrok](https://ngrok.com/)
- OpenAI API Key
- Retell API Key and a [Retell Agent](https://beta.retellai.com/dashboard/agents)

## Run the frontend

1. Go to the frontend directory

```bash
cd frontend
```

2. Install the dependencies

```bash
bun install
```

3. Start the frontend

```bash
bun dev
```

4. Open in your browser: http://localhost:3000

## Run the server

1. Navigate to the backend directory

```bash
cd backend
```

2. Install the requirements

```bash
pip install -r requirements.txt
```

3. Add your OpenAI API and Retell API keys to the `.env` file

```bash
OPENAI_API_KEY=[YOUR_OPEN_AI_KEY]
RETELL_API_KEY=[YOUR_RETELL_AI_KEY]
```

4. Start server

```bash
uvicorn main:app --reload
```

5. Tunnel the server to the internet using ngrok

```bash
ngrok http 8000
```

6. Set the `Custom LLM URL` for your [Retell agent](https://beta.retellai.com/dashboard/agents) the ngrok url + /voice/llm-websocket

Example:

`https://e253-128-195-97-137.ngrok-free.app/voice/llm-websocket`
