from flask import Blueprint

configs_bp = Blueprint('configs', __name__)

from app.configs import configs