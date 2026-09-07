"""Test configuration shared by the whole suite.

The service is imported as `app.*`, so `backend/` has to be importable. Pytest
adds this file's directory to sys.path, which is exactly what is wanted, but
being explicit keeps the suite runnable from anywhere.
"""

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))
