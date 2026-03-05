import time
from flask import Flask, render_template, request, redirect, url_for
from bitcoinrpc.authproxy import AuthServiceProxy
from datetime import datetime
import requests

app = Flask(__name__)

# --- GLOBALNE VARIJABLE ZA CACHE ---
cached_price = None
last_update_time = 0

RPC_USER = 'student'
RPC_PASSWORD = 'n25PaIR75EwPyeMi1Gl4fZ8xl2jd8kr2REi2TT8TnSEB6cx4bVt1R2f'
RPC_HOST = 'blockchain.oss.unist.hr'
RPC_PORT = '50004' 

connection_url = f"http://{RPC_USER}:{RPC_PASSWORD}@{RPC_HOST}:{RPC_PORT}"

def get_rpc():
    return AuthServiceProxy(connection_url)

def get_btc_price():
    global cached_price, last_update_time
    current_time = time.time()
    if cached_price is not None and (current_time - last_update_time < 60):
        return cached_price
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
        response = requests.get(url, timeout=3).json()
        cached_price = response['bitcoin']['eur']
        last_update_time = current_time
        return cached_price
    except:
        return cached_price if cached_price is not None else None

@app.template_filter('format_ts')
def format_ts(value):
    try:
        return datetime.fromtimestamp(int(value)).strftime('%d.%m.%Y. u %H:%M:%S')
    except:
        return value

@app.route('/')
def index():
    try:
        rpc = get_rpc()
        best_block_hash = rpc.getbestblockhash()
        latest_blocks = []
        current_hash = best_block_hash
        for _ in range(10):
            block = rpc.getblock(current_hash)
            latest_blocks.append(block)
            current_hash = block.get('previousblockhash')
            if not current_hash: break
        now = datetime.now().strftime('%d.%m.%Y. %H:%M:%S')
        price = get_btc_price()
        return render_template('index.html', blocks=latest_blocks, now=now, price=price)
    except Exception as e:
        return f"Greška na serveru: {e}"

@app.route('/block/<block_hash>')
def block_details(block_hash):
    try:
        rpc = get_rpc()
        if block_hash.isdigit():
            block_hash = rpc.getblockhash(int(block_hash))
        block_info = rpc.getblock(block_hash)
        stats = None
        try: stats = rpc.getblockstats(block_hash)
        except: pass 
        price = get_btc_price()
        return render_template('block.html', block=block_info, stats=stats, price=price)
    except:
        return "Blok nije pronađen. <a href='/'>Povratak</a>"

@app.route('/tx/<txid>')
def tx_details(txid):
    try:
        rpc = get_rpc()
        tx_info = rpc.getrawtransaction(txid, 1)
        price = get_btc_price()
        return render_template('tx.html', tx=tx_info, price=price)
    except Exception as e:
        return f"Transakcija nije pronađena. (Provjerite txindex=1 na serveru) <br> Greška: {e}"

@app.route('/search', methods=['POST'])
def search():
    query = request.form.get('query', '').strip()
    if not query: return redirect(url_for('index'))

    if query.isdigit():
        return redirect(url_for('block_details', block_hash=query))

    if len(query) == 64:
        rpc = get_rpc()
        try:
            rpc.getrawtransaction(query)
            return redirect(url_for('tx_details', txid=query))
        except:
            return redirect(url_for('block_details', block_hash=query))
            
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5050)