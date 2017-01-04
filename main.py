import os
from flask import Flask, Response, json
app = Flask(__name__)

@app.route("/v4/report/<ip>/<name>")
def hello(ip,name):
    command = 'ssh oracle@%s "curl -kL https://raw.githubusercontent.com/shinhwagk/OracleStackObservation/master/back/conf/reports/os/%s.sh | /bin/bash"' % (ip,name)
    rs = os.popen(command)
    b = rs.readlines()[0]
    return Response(b,  mimetype='application/json')

if __name__ == "__main__":
    app.run(host='0.0.0.0')