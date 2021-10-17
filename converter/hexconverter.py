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

# Path to retrieve hex file, if it is a directory, search the hex files in the folder
# If it only a file path, test if it is a valid hex file
_parser.add_argument("path")

# Path to output the converted files
# If not set it as working directory
_parser.add_argument("out", default=None)

# Do convesion for each file
def do_conversion(src, out):
    pass


# Read files from the source directory to retrieve hex file
def scan_hex_files(dir):
    pass


# The main entry
def main_entry():
    pass
