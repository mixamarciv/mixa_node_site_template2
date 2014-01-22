CALL set_path.bat

:: ===========================================================================
:: запускаем supervisor с нужными параметрами
@SET watch=./config,./routes,./views
@SET watch=%watch%,./app.js

@echo %watch%

supervisor.cmd -w %watch% app.js

:: ===========================================================================
:: конец
@pause
