::получаем curpath:
@for /f %%i in ("%0") do set curpath=%~dp0

::задаем основные переменные окружения
@CALL "%curpath%set_path.bat"

@echo ==================================================
@echo создаем временные каталоги temp и log:
mkdir temp
mkdir log

@echo ==================================================
@echo установка зависимостей из package.json:
CALL npm install

@echo ==================================================
@echo установка внешних js библиотек (через bower):
CALL bower install

@echo ==================================================
@echo все
@pause