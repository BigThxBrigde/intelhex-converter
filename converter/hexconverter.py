#!/usr/bin/env python3

import os
import sys
import logging
import logging.handlers
import argparse
from intelhex import IntelHex
from genericpath import isfile, isdir

# Attention: `pathlib` only works >= python3.4
from pathlib import Path as PathObject
from os import path

# To avoid exit is not defined error after py2exe packed, must import `exit`
# https://stackoverflow.com/questions/45066518/nameerror-name-exit-is-not-defined
from sys import exit

_logger = None  # logger object
_parser = None  # argparser object
_msgsender = None  # message sender

_HEX_EXT = ".hex"  # hex file extension
_POSTFIX = "SH"  # converted hex file postfix

_R_SUCCESS = 0  # convert success
_R_FAIL = -1  # convert failed
_R_UNKNOWN = -2  # unexpected error happened

"""
Converted hex file structure:

SECTOR           		NUM           COMMENT
Bank0_MAC_Para		    14
Bank0_MAC_checksum		2
Bank0_other_Para		others        dynamic length
Bank0_other_checksum	2

Bank1_MAC_Para		    14            copy of Bank0_MAC_Para
Bank1_MAC_checksum		2             copy of Bank0_MAC_checksum
Bank1_other_Para		others        copy of Bank0_other_Para
Bank1_other_checksum	2             copy of Bank0_other_checksum

EZY	                	the rest
EZY_checksum		    2

Bank2_MAC_Para		    14            copy of Bank0_MAC_Para
Bank2_MAC_checksum		2             copy of Bank0_MAC_checksum
Bank2_other_Para		others        copy of Bank0_other_Para
Bank2_other_checksum	2             copy of Bank0_other_checksum 
"""

_MAC0_START = 1  # Bank0_MAC start address
_MAC0_END = 16  # Bank0_MAC end address
_MAC0_LEN = 16  # Bank0_MAC total size
_PARA0_START = _MAC0_END + 1  # Bank0_other start address
_IN_END = 511  # EZY end address

_OUT_LEN = 0x1000  # conveted hex file total size
_OUT_SEC0 = 0x0000  # Bank0_MAC start address
_OUT_SEC1 = 0x0200  # Bank0_other start address
_OUT_SEC2 = 0x0400  # Bank1_MAC start address
_OUT_SEC3 = 0x0600  # Bank1_other start address
_OUT_SEC4 = 0x0800  # EZY start address
_OUT_SEC5 = 0x0A00  # Bank2_MAC start address
_OUT_SEC6 = 0x0C00  # Bank2_other start address
# _OUT_SEC7 = 0x0E00 # not used at current
_S_PROC = "PROC"
_S_SUCCESS = "SUCC"
_S_FAIL = "FAIL"

# Initialize the option
def init_option():
    # parse arguments
    parser = argparse.ArgumentParser()

    # Path to retrieve hex file, if it is a directory, search the hex files in the folder
    # If it only a file path, test if it is a valid hex file
    parser.add_argument(
        "--path",
        help="""If the path is a directory,
                        retreving all the hex files in it.k
                        Else it must be a hex file.""",
    )

    # Path to output the converted files
    # If not set it as working directory
    parser.add_argument(
        "--out",
        default=None,
        help="""Specify where the converted files would be output,
                        If not set, the working directory is default.""",
    )

    # https://stackoverflow.com/questions/8259001/python-argparse-command-line-flags-without-arguments
    parser.add_argument(
        "--messaging",
        action="store_true",
        help="""Specify if app would send additional message to `stdout`""",
    )
    return parser


def post_message(src, dest, status):
    _msgsender.post(msg={"source": src, "target": dest, "status": status})


# initialize the logger
def init_logger():
    logger = logging.getLogger("hex-conveter")
    logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler("hex-converter.log")
    file_handler.setFormatter(
        logging.Formatter(
            "%(asctime)s - [%(levelname)-7s] # %(funcName)-20s# %(lineno)-4d: %(message)s"
        )
    )
    logger.addHandler(file_handler)

    std_stream_handler = logging.StreamHandler(sys.stdout)
    std_stream_handler.setLevel(logging.DEBUG)
    std_stream_handler.setFormatter(
        logging.Formatter(
            "%(asctime)s - [%(levelname)-7s] # %(funcName)-20s# %(lineno)-4d: %(message)s"
        )
    )

    logger.addHandler(std_stream_handler)
    return logger


# initialize message sender
def init_msgsender():
    from msgsender import MessageSender

    return MessageSender()


# Do conversion for all files
def do_conversion(files, dest):
    result = True
    for file in files:
        name = get_name_noext(file)
        if _POSTFIX in name:
            _logger.warning("%s has already been converted", file)
            continue

        name += _POSTFIX + _HEX_EXT

        output = path.join(dest, name)
        output = get_full_path(output)

        _logger.info("Convert %s -> %s", file, output)

        result = True if convert_hex_file(file, output) and result else False

    return result


# Do convesion for each file
def convert_hex_file(src, dest):

    out_fs = None
    in_hex = None
    out_hex = None
    post_message(src, dest, _S_PROC)

    try:
        out_fs = open(dest, "w")

        in_hex = IntelHex()
        out_hex = IntelHex()

        in_hex.fromfile(src, format="hex")
        out_hex.fromfile(dest, format="hex")

        mac0_block = in_hex.gets(_MAC0_START, _MAC0_LEN)

        # Found the mac0_block index
        index = in_hex.find(mac0_block, _PARA0_START)
        _logger.debug("Found start address: %s", index)
        if index == -1:
            post_message(src, dest, _S_FAIL)
            return False
        para0_len = index - _PARA0_START
        _logger.info("Calculated other para size: %s", para0_len)
        para0_block = in_hex.gets(_PARA0_START, para0_len)

        # EZY start address = Blank0_MAC start address + (Blank0_MAC total size + Blank0_other total size) * 2
        ezy_start = _MAC0_START + (_MAC0_LEN + para0_len) * 2
        ezy_block = in_hex.gets(ezy_start, _IN_END - ezy_start + 1)

        # Initialize all blocks with empty
        blank_block = bytearray(_OUT_LEN)
        out_hex.puts(_OUT_SEC0, bytes(blank_block))

        out_hex.puts(_OUT_SEC0, mac0_block)
        out_hex.puts(_OUT_SEC1, para0_block)
        out_hex.puts(_OUT_SEC2, mac0_block)
        out_hex.puts(_OUT_SEC3, para0_block)
        out_hex.puts(_OUT_SEC4, ezy_block)
        out_hex.puts(_OUT_SEC5, mac0_block)
        out_hex.puts(_OUT_SEC6, para0_block)

        out_hex.write_hex_file(dest)

        post_message(src, dest, _S_SUCCESS)
        return True
    except Exception as err:
        _logger.error(err)
        post_message(src, dest, _S_FAIL)
        return False
    finally:
        if out_fs is not None:
            out_fs.close()


# Read files from the source directory to retrieve all hex files
def scan_hex_files(inpath):
    if not exists_path(inpath):
        _logger.error("Input path: %s not exists", inpath)
        return []

    # check if it is a valid hex file
    def is_valid_hex_file(f):
        _, file_extension = path.splitext(f)
        return file_extension.lower() == _HEX_EXT

    # retrieve all the hex files for dictory
    def retrieve_all_hex_files(folder):
        p = os.walk(folder)
        for _, dirs, files in p:
            for dir in dirs:
                for file in retrieve_all_hex_files(dir):
                    yield get_full_path(file)
            for file in files:
                if is_valid_hex_file(file):
                    yield get_full_path(file)

    if isfile(inpath):
        return [] if not is_valid_hex_file(inpath) else [inpath]
    elif isdir(inpath):
        return list(retrieve_all_hex_files(inpath))
    else:
        return []


# get the absolute path
def get_full_path(path):
    return str(PathObject(path).resolve().absolute())


# Check if the path or file is exists or not
def exists_path(path):
    return PathObject(path).resolve().exists()


# Get a file name without extension
def get_name_noext(path):
    return PathObject(path).stem


# format the option
def format_option(arg_dict):
    _logger.info("Arguments read: %s", arg_dict)
    input_path = arg_dict["path"]
    output_path = arg_dict["out"]
    messaging = arg_dict["messaging"]

    if input_path is None:
        _logger.error("Input path is empty, converter exit")
        return None

    input_path = get_full_path(input_path)

    if output_path is None:
        output_path = os.getcwd()
    else:
        output_path = get_full_path(output_path)

    _logger.info("Input path: %s", input_path)
    _logger.info("Out path: %s", output_path)

    return input_path, output_path, messaging


# The main entry
def main_entry():
    arg_dict = vars(_parser.parse_args())
    opt = format_option(arg_dict)

    if opt is None:
        return _R_FAIL

    input_path, out_path, messaging = opt

    hex_files = scan_hex_files(input_path)

    if len(hex_files) == 0:
        _logger.info("No hex files found, conveter exit")
        return _R_SUCCESS

    _logger.info("Addtional message would be sent: %s", messaging)
    if messaging:
        _msgsender.enable = True

    try:
        return _R_SUCCESS if do_conversion(hex_files, out_path) else _R_FAIL
    except Exception as err:
        _logger.critical(err)
        return _R_UNKNOWN


if __name__ == "__main__":
    try:
        _logger = init_logger()
        _parser = init_option()
        _msgsender = init_msgsender()

        exit(main_entry())
    except Exception as err:
        print(err)
        exit(_R_UNKNOWN)
