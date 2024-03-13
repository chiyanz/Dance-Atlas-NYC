import time
from datetime import datetime, timedelta, date
from zoneinfo import ZoneInfo


timestamp = datetime.now(ZoneInfo("America/New_York"))
timestamp2 = timestamp - timedelta(hours=168)
print(str(timestamp2.date()) + "_" + str(timestamp.date()))