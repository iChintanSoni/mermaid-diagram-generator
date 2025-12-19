# Define the directory name
REPO_DIR="a2a-inspector"

# Check if the directory already exists
if [ -d "$REPO_DIR" ]; then
    echo "Directory $REPO_DIR already exists. Skipping clone and pulling latest changes..."
    cd "$REPO_DIR"
    git pull
else
    git clone https://github.com/a2aproject/a2a-inspector.git
    cd "$REPO_DIR"
fi

# Continue with the rest of the setup
uv sync
cd frontend
npm install
cd ..
chmod +x scripts/run.sh
bash scripts/run.sh