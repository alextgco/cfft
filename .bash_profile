# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

# User specific environment and startup programs

PATH=$PATH:$HOME/bin

export PATH

# For oracle-changed
export ORACLE_HOME=/u01/app/instantclient_12_1
export ORACLE_SID=orcl
export NLS_LANG=.UTF8
# For search global nodejs modules
export NODE_PATH=/usr/lib/node_modules
