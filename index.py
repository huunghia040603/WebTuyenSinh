from flask import Flask, app
from flask import render_template, request, redirect, jsonify, session, json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/dai-hoc-hcm")
def dai_hoc_hcm():
    return render_template('dh-hcm.html')

@app.route("/truongdaihoc/ou")
def dai_hoc_ou():
    return render_template('truongdaihoc/daihocmo.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route("/dangnhap")
def dangnhap():
    return render_template('dangnhap.html')

@app.route("/dangky")
def dangky():
    return render_template('dangnhap.html')

@app.route("/mbti")
def mbti():
    return render_template('/khampha/mbti.html')

@app.route("/mota")
def mota():
    return render_template('/khampha/mota.html')

@app.route("/visao")
def visao():
    return render_template('/khampha/visao.html')

if __name__ == "__main__":
    app.run(debug=True)
