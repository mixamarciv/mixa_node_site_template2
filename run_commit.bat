::�������� curpath:
@for /f %%i in ("%0") do set curpath=%~dp0

::������ �������� ���������� ���������
@CALL "%curpath%set_path.bat"

@git commit -m "%date% %time%" -a

@cmd