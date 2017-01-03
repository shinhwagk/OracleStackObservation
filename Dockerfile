FROM 3.6.0-onbuild

RUN pip install flask
RUN pip install paramiko

CMD ["python", "main.py"]