:: ===========================================================================
:: переходим в каталог запуска скрипта
::@SetLocal EnableDelayedExpansion
:: this_file_path - путь к текущему бат/bat/cmd файлу
@SET this_file_path=%~dp0

:: this_disk - диск на котором находится текущий бат/bat/cmd файл
@SET this_disk=%this_file_path:~0,2%

:: переходим в текущий каталог
@%this_disk%
@CD "%this_file_path%"


:: ===========================================================================
:: задаем основные пути для запуска скрипта
@SET NODE_PATH_BIN1=d:\programs\nodejs
@SET NODE_PATH_BIN2=d:\program\nodejs
@SET GIT_PATH=d:\programs\nodejs\git
@SET GIT_PATH2=d:\program\nodejs\git
@SET PYTHON_PATH=d:\programs\nodejs\Python26
@SET PYTHON_PATH2=d:\programs\nodejs\Python26

@SET PATH=%WINDIR%;%WINDIR%\system32
@SET PATH=%PATH%;%PYTHON_PATH%;%GIT_PATH%;%GIT_PATH%\bin;%GIT_PATH%\cmd
@SET PATH=%PATH%;%PYTHON_PATH2%;%GIT_PATH2%;%GIT_PATH2%\bin;%GIT_PATH2%\cmd
@SET PATH=%PATH%;%NODE_PATH_BIN1%
@SET PATH=%PATH%;%NODE_PATH_BIN2%
@SET PATH=%PATH%;%NODE_PATH_BIN1%\node_modules\npm\node_modules
@SET PATH=%PATH%;%NODE_PATH_BIN2%\node_modules\npm\node_modules
@SET PATH=%PATH%;%NODE_PATH_BIN1%\node_modules\.bin
@SET PATH=%PATH%;%NODE_PATH_BIN2%\node_modules\.bin
@SET PATH=%PATH%;.\node_modules\.bin

@SET NODE_PATH=.
::ECHO %PATH%
:: ===========================================================================
:: уничтожаем уже запущенные процессы node
:: @taskkill /IM node.exe /f /T

