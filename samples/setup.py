# http://irootlee.com/Py2exe/
# http://www.py2exe.org/index.cgi/Tutorial

from distutils.core import setup
import py2exe
import sys

sys.argv.append('py2exe')

py2exe_options = {
        "compressed": 1,
        "optimize": 2,
        "bundle_files": 2,
        }

setup(
    name = 'convert',
    version = '1.0',
    console = ['hex2hex-s.py'],
    options = {'py2exe': py2exe_options}
    )
