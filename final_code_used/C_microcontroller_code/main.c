/* This is a blank template program  
 * 
 */

#include "lpc111x.h"
volatile int PWMCounter=0;
volatile int Channel3Duty=0;
volatile int Channel5Duty=0;
void delay(unsigned len)
{
	while(len--);
}
void ConfigPins()
{
	SYSAHBCLKCTRL |= BIT6 + BIT13 + BIT16; // Turn on clock for GPIO,ADC and IOCON 
	IOCON_PIO0_2 &= ~(BIT1+BIT0);  // ensure Pin 25 behaves as GPIO
	IOCON_R_PIO1_0 = BIT0 + BIT4 + BIT7; // digital mode, pull up resistor
	IOCON_R_PIO1_1= BIT0 + BIT4 + BIT7; // digital mode, pull up resistor
	IOCON_R_PIO1_2 = BIT0 + BIT4 + BIT7; // digital mode, pull up resistor
	
	GPIO0DIR |= 0x1fc;	       // make bits 1 to 7 outputs	
	GPIO0DATA = 0;				// 0 output initially
	// select analog mode for PIO1_0
	IOCON_R_PIO0_11 = 2;
	// Power up the ADC
	PDRUNCFG &= ~BIT4; 
	// set ADC clock rate and select channel 1
	AD0CR=(11<<8)+BIT0;
	
}
int ReadADC(int Chan)
{
	int ChannelMask = 1 << Chan;
	// Start a conversion	
	AD0CR |= ChannelMask+BIT24;
	// Wait for conversion to complete
	while((AD0GDR&BIT31)==0);
	// return the result
	return ((AD0GDR>>6)&0x3ff);
}
int ReadDigital(int bitnumber)
{
	/* Three digital inputs are supported : PIO1_0,PIO1_1,PIO1_2
	 * returns 0 otherwise
	*/
	switch (bitnumber)
	{
		case 0: {
			if (GPIO1DATA & BIT0)
				return 1;
			else
				return 0;
			break;
		}
		case 1: {
			if (GPIO1DATA & BIT1)
				return 1;
			else
				return 0;
			break;
		}
		case 2: {
			if (GPIO1DATA & BIT2)
				return 1;
			else
				return 0;			
			break;
		}
		default:
			return 0;
	}
}
void WriteDigital(int bitnumber, int value)
{
	// 7 outputs are supported:
	// PIO0_2 to PIO0_8
	switch (bitnumber)
	{
		case 0: {
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT2;
			else
				GPIO0DATA = GPIO0DATA & ~BIT2;
			break;
		}
		case 1: {
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT3;
			else
				GPIO0DATA = GPIO0DATA & ~BIT3;
			break;
		}
		case 2: {
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT4;
			else
				GPIO0DATA = GPIO0DATA & ~BIT4;
			break;
		}
		case 3: {  
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT5;
			else
				GPIO0DATA = GPIO0DATA & ~BIT5;
			break;
		}
		case 4: {
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT6;
			else
				GPIO0DATA = GPIO0DATA & ~BIT6;
			break;
		}
		case 5: {
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT7;
			else
				GPIO0DATA = GPIO0DATA & ~BIT7;
			break;
		}
		case 6: {
			if (value == 1)
				GPIO0DATA = GPIO0DATA | BIT8;
			else
				GPIO0DATA = GPIO0DATA & ~BIT8;
			break;
		}
	}
}
int GetCommand(char *cmd, int maxlen)
{
	int Done=0;
	int Index=0;
	while (!Done)
	{
		while(rx_count()==0); // wait for a byte
		cmd[Index]=egetc();   // read the character
		if (cmd[Index]=='$')
			Done=1;
		else
		{
			Index++;
			if (Index >= maxlen)
				return -1; // got gibberish
		}
	}
	return 0; // got a command
}

void ScadaInterface()
{
	char str[20];
	// Read data received over the serial port
	if (GetCommand(str,20) < 0)
		return;
	// Command formats:
	// aN
	// read analog channel N.  Reply in decimal 
	// iN 
	// read digital input N.  Reply 1 or 0
	// oNS
	// set digital output N to state S (1 or 0)
	
	switch(str[0]) {
		case 'a': {
			// read analog input
			int channel=str[1]-'0';
			int Result=ReadADC(channel);
			printInteger(Result);
			break;
		}
		case 'i' : {
			// read digital input
			int bitNumber = str[1]-'0';
			int Result=ReadDigital(bitNumber);
			printInteger(Result);
			break;
		}
		case 'o' : {
			// write digital output
			int bitNumber = str[1] - '0';
			int state = str[2] - '0';
			WriteDigital(bitNumber,state);
			break;
		}
		case 'l' : {
			// set output level
			int OutputChannel = str[1]-'0';
			// digital outputs 3 and 5 are to be settable
			// packet format is as follows:
			// lNLLL$
			// where N is channel number (3 or 5)
			// LLL is the value in the range '000' to '100'
			int Level = (str[2]-'0')*100;
			Level = Level + (str[3]-'0')*10;
			Level = Level + (str[4]-'0');
			if (OutputChannel==3)
			{
				Channel3Duty=Level;
			}
			if (OutputChannel==5)
			{
				Channel5Duty=Level;
			}
		}
	}
}
void SysTick(void)
{
	PWMCounter++;
	if (PWMCounter >=100)
	{
		PWMCounter = 0;
		WriteDigital(3,1);
		WriteDigital(5,1);
	}	
	if (Channel3Duty <= PWMCounter)
	{
		WriteDigital(3,0);
	}
	if (Channel5Duty <= PWMCounter)
	{
		WriteDigital(5,0);
	}
}
void initSysTick()
{
	
	// The systick timer is driven by a 48MHz clock
	// Divide this down to achieve a 1ms timebase
	// Divisor = 48MHz/1000Hz
	// Reload value = 48000-1
	// enable systick and its interrupts
	SYST_CSR |=(BIT0+BIT1+BIT2); 
	SYST_RVR=4800-1; // generate 0.1 millisecond time base
	SYST_CVR=5;
	enable_interrupts();
}
int main()
{	
	initSysTick();
	ConfigPins();
	initUART();
	enable_interrupts();
	printString("Hello World");
	while(1) 
	{
		ScadaInterface();	
		
	}    
}



