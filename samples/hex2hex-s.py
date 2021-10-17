# -*- coding: utf-8 -*-
import os
import time
from intelhex import IntelHex

# get '.hex' file name from current path
def getFileNamebyEX(path):
    f_list = os.listdir(path)
    for i in f_list:
        filename = os.path.splitext(i)[0]
        extname = os.path.splitext(i)[1]
        if extname == '.hex':
            print(" *Hex file : " + filename + extname+'*')
            #return i
            return filename
'''
def creatNewBlankHex(new_hex_file):
	fs = open('./new/' + new_hex_file, 'w')
	ihs = IntelHex()
	ihs.fromfile('./new/' + new_hex_file, format='hex')
	for i in range(2048):
		ihs[i] = 0xFF
	ihs.write_hex_file('./new/' + new_hex_file)
	fs.close()
	return 0
	
def creatNewBlankTempHex():
	ft = open('./new/' + 'temp.hex', 'w')
	iht = IntelHex()
	iht.fromfile('./new/' + 'temp.hex', format='hex')
	for i in range(2048):
		iht[i] = 0x00
	iht.write_hex_file('./new/' + 'temp.hex')
	ft.close()
	return 0
'''
	
def main():

	hex_file_name = getFileNamebyEX('.')
	hex_file_old = hex_file_name+'.hex'
	hex_file_new = './new/'+hex_file_name+'SH'+'.hex'
	
	print(hex_file_old)
	#creatNewBlankTempHex()
	f = open(hex_file_old, 'r')
	fs = open(hex_file_new, 'w')

	ih = IntelHex()
	ihs = IntelHex()

	ih.fromfile(hex_file_old, format='hex')
	ihs.fromfile(hex_file_new, format='hex')
	
	ihs_sector0=0x000
	ihs_sector1=0x200
	ihs_sector2=0x400
	ihs_sector3=0x600
	ihs_sector4=0x800
	ihs_sector5=0xA00
	#ih[15] and ih[16] are mac parameter checksum
	#So, try to find next checksum index from 17 ..
	mac0_start = 1
	mac0_end = 16
	para0_start = 17
	for i in range(17,511):
		if (ih[i] == ih[15]):
			if(ih[i+1] == ih[16]):
				j=i+1
			else:
				i+=i
		else:
			i+=i
			
	para0_end = j-16
	para_num = (para0_end-mac0_end)
	para1_end = j+para_num
	ezy_start = para1_end+1
	ezy_end = 511
	
	for i in range(mac0_end):
		ihs[i]=ih[i+1]
	for i in range(mac0_end,ihs_sector1):
		ihs[i]=0x00
		
	for i in range(para0_start, para0_end+1):
		ihs[ihs_sector1] = ih[i]
		ihs_sector1 = ihs_sector1+1
	for i in range(ihs_sector1,ihs_sector2):
		ihs[i]=0x00	
		
	for i in range(mac0_end):
		ihs[ihs_sector2]=ih[i+1]
		ihs_sector2 = ihs_sector2+1
	for i in range(ihs_sector2,ihs_sector3):
		ihs[i]=0x00
		
	for i in range(para0_start, para0_end+1):
		ihs[ihs_sector3] = ih[i]
		ihs_sector3 = ihs_sector3+1	
	for i in range(ihs_sector3,ihs_sector4):
		ihs[i]=0x00
		
	for i in range(ezy_start, ezy_end+1):
		ihs[ihs_sector4] = ih[i]
		ihs_sector4 = ihs_sector4+1
	for i in range(ihs_sector4,ihs_sector5):
		ihs[i]=0x00
		
	# i = 17
	print(j)
	print(para0_end)
	print(para_num)
	print(para1_end)
	print(ezy_start)	
	
	ihs.write_hex_file(hex_file_new)
	fs.close()

if __name__ == '__main__':
    main()

'''		
ih = IntelHex()
ih.fromfile(hex_file_name, format='hex')
# f = open('hexdump.hex','r')
fs = open('./new/hex_file_name','r')
ih[1:17].write_hex_file(f)
f.close()

starttime = time.clock()
hex_file_name = getFileNamebyEX('.')
bin_file_name = hex_file_name[:-4]+'.bin'
hex2bin(hex_file_name,bin_file_name)
wr_bin(bin_buf)
endtime = time.clock()
  
print(' Time elapsed:' + str(endtime-starttime))
'''