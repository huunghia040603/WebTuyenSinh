from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="webtuyensinh",
    version="1.0.0",
    author="WebTuyenSinh Team",
    author_email="contact@webtuyensinh.com",
    description="Hệ thống tư vấn hướng nghiệp với tính năng thống kê",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/webtuyensinh",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Education",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-flask>=1.2.0",
            "pytest-cov>=4.1.0",
            "coverage>=7.2.7",
            "flake8>=6.0.0",
            "black>=23.7.0",
            "isort>=5.12.0",
            "python-dotenv>=1.0.0",
            "flask-debugtoolbar>=0.13.1",
            "httpx>=0.24.1",
        ],
        "prod": [
            "gunicorn>=21.2.0",
            "python-dotenv>=1.0.0",
            "cryptography>=41.0.4",
        ],
    },
    entry_points={
        "console_scripts": [
            "webtuyensinh=start_server:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.html", "*.css", "*.js", "*.png", "*.jpg", "*.gif", "*.mp3"],
    },
) 