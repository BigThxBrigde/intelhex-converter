#!/usr/bin/env python3

import os
import time
import logging
import argparse

from intelhex import IntelHex

# logging something
_log = logging.getLogger(__name__)
# parse arguments
_parser = argparse.ArgumentParser()
_parser.add_argument("path")
_parser.add_argument("out")
# Do convesion for each file
def do_conversion(file):
    pass


# Read files from the source directory to retrieve hex file
def read_hex_files(dir):
    pass


def main_entry():
    pass
