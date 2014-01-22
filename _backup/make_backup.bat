@echo off
:: скрипт для создания бэкапов
GOTO set_my_date_time
:my_date_time_is_set


SET   backupFrom="../*"
SET     backupTo=D:/_backups/mixa_node_site_template2
SET   backupName=np3__%my_date_time%__%COMPUTERNAME%

SET PATH=c:\Program Files\7-Zip;c:\Program Files (x86)\7-Zip;%PATH%
SET PATH=d:\Program Files\7-Zip;d:\Program Files (x86)\7-Zip;%PATH%
SET PATH=e:\Program Files\7-Zip;e:\Program Files (x86)\7-Zip;%PATH%
SET PATH=f:\Program Files\7-Zip;f:\Program Files (x86)\7-Zip;%PATH%
SET PATH=f:\port_programs\archiv\7-Zip;f:\pp\archiv\7-Zip;%PATH%     
SET PATH=e:\port_programs\archiv\7-Zip;e:\pp\archiv\7-Zip;%PATH%     
SET PATH=c:\port_programs\archiv\7-Zip;c:\pp\archiv\7-Zip;%PATH%     
SET PATH=d:\port_programs\archiv\7-Zip;d:\pp\archiv\7-Zip;%PATH%     


@echo ====================================================
@7z.exe a -t7z "%backupTo%/%backupName%.7z" %backupFrom% -m"x=9" -x@"%~dp0make_backup__exclude_files.txt" -i@"%~dp0make_backup__include_files.txt"
::-x@"%~dp0make_backup__exclude_files.txt" 
::-i@"%~dp0make_backup__include_files.txt"
@echo ====================================================
@echo backup:
@echo %backupTo%/%backupName%.7z


if "%1"=="no_pause" GOTO end

@pause

:end



GOTO end_set_my_date_time
:set_my_date_time
@echo off
::скрипт использует date.exe от UnixUtils  (sourceforge.net/projects/unxutils/files) переименованный в make_backup__date.exe
for /f "tokens=1,2,3,4,5,6* delims=," %%i in ('%~dp0make_backup__date.exe +"%%Y,%%m,%%d,%%H,%%M,%%S"') do set yy=%%i& set mo=%%j& set dd=%%k& set hh=%%l& set mm=%%m& set ss=%%n
echo %yy% %mo% %dd% %hh% %mm% %ss%
SET my_date=%yy%%mo%%dd%
SET my_time=%hh%%mm%%ss%
SET my_date_time=%my_date%_%my_time%
GOTO my_date_time_is_set
:end_set_my_date_time


