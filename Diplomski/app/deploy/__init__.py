from flask import Blueprint

deploy_bp = Blueprint('deploy', __name__)

from app.deploy import deploy
