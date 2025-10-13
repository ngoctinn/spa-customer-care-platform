#!/usr/bin/env bash
cd back-end
source .venv/Scripts/activate
uvicorn app.main:app --reload
