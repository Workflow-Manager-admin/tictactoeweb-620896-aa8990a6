#!/bin/bash
cd /tmp/kavia/workspace/code-generation/tictactoeweb-620896-aa8990a6/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

