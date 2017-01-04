FROM python:3.6.0-onbuild

RUN pip install flask
RUN pip install paramiko

ADD main.py main.py

CMD ["python", "main.py"]