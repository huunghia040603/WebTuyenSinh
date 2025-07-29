from flask import Flask, app
from flask import render_template, request, redirect, jsonify, session, json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/dai-hoc-hcm")
def dai_hoc_hcm():
    return render_template('dh-hcm.html')

# @app.route("/truongdaihoc/ou")
# def dai_hoc_ou():
#     return render_template('truongdaihoc/daihocmo.html')

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

@app.route("/nganhchung")
def nganhchung():
    return render_template('nganhchung.html')

@app.route("/<university_code>")
def university_detail(university_code):
    return render_template('truongdaihoc/chitiet.html')

@app.route("/demo")
def demo():
    return render_template('demo.html')

@app.route("/nganh/<major_id>")
def major_detail(major_id):
    return render_template('chitiet-nganhchung.html')

@app.route("/mbtinew")
def mbtinew():
    return render_template('khampha/mbtinew.html')

@app.route("/moi")
def moi():
    return render_template('khampha/moi.html')

@app.route("/zodiac")
def cunghoangdao():
    return render_template('cunghoangdao.html')

@app.route("/mbti-new")
def mbti_new():
    return render_template('mbti/mbti_new.html')

if __name__ == "__main__":
    app.run(debug=True)
