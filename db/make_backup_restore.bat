::@echo off
SET PATH=%PATH%;c:\Program Files\Firebird\Firebird_2_1\bin;d:\mixa\_webserver\Firebird_2_1\bin
SET DB_NAME=app_db.fdb

SET user_pass=-USER sysdba -PASSWORD masterkey

gbak.exe -B "%DB_NAME%"     "%DB_NAME%.bak" %user_pass%
gbak.exe -R "%DB_NAME%.bak" "%DB_NAME%.new" %user_pass%

pause