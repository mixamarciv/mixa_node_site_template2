CALL set_path.bat

@echo ==================================================
@echo ᮧ���� �६���� ��⠫��� temp � log:
mkdir temp
mkdir log

@echo ==================================================
@echo ��⠭���� ����ᨬ��⥩ �� package.json:
CALL npm install

@echo ==================================================
@echo ��⠭���� ���譨� js ������⥪ (�१ bower):
CALL bower install

@echo ==================================================
@echo ��
@pause