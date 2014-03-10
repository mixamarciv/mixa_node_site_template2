::получаем curpath:
@for /f %%i in ("%0") do set curpath=%~dp0

::задаем основные переменные окружения
@CALL "%curpath%set_path.bat"

:: ===========================================================================
:: уничтожаем уже запущенные процессы node
::echo "%date% %time%" >> test.log


@cls


::@SET external_app="%1"
::@IF NOT %external_app% EQ "" GOTO no_main_app

@SET title=app.js server
::@taskkill /IM cmd.exe /f /fi "Windowtitle eq %title%" /T
::@taskkill /IM node.exe /f /fi "Windowtitle eq %title%"
::@title %title%

:no_main_app

:: ===========================================================================
:: запускаем наш процесс
node.exe app.js %1 %2 %3 %4 %5 %6 %7 %8 %9


:: ===========================================================================
:: конец
::@pause
