::получаем curpath:
@for /f %%i in ("%0") do set curpath=%~dp0

::задаем основные переменные окружения
@CALL "%curpath%set_path.bat"
@echo ==================================================
@echo создаем временные и log каталоги:
mkdir "temp"
mkdir "temp/log_app"

@echo ==================================================
@echo установка зависимостей из package.json:
CALL npm install

@echo ==================================================
@echo установка mixa_std_js_functions
@cd node_modules
git clone https://github.com/mixamarciv/mixa_std_js_functions.git
@cd ..

@echo ==================================================
@echo установка внешних клиентских js библиотек (через bower):
CALL bower install

@echo ==================================================
@echo все
@pause