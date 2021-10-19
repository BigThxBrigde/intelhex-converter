import json
from sys import stdout


# https://stackoverflow.com/questions/26745519/converting-dictionary-to-json

_MSG_IDENT = "__MSG__IDENT__"


class MessageSender:
    def __init__(self):
        self._enable = False

    def post(self, **msg):
        if self._enable:
            import os

            m = json.dumps(msg)
            m = _MSG_IDENT + "|" + m + os.linesep
            stdout.write(m)

    @property
    def enable(self):
        return self._enable

    @enable.setter
    def enable(self, value):
        self._enable = value

    @enable.deleter
    def enable(self):
        del self._enable
