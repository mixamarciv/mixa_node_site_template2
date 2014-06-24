::получаем curpath:
@for /f %%i in ("%0") do set curpath=%~dp0

::задаем основные переменные окружения
@CALL "%curpath%set_path1.bat"

git clone https://github.com/mixamarciv/mixa_node_site_template2.git

pause