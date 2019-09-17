(function(window, document, undefined) {
  /** 与えられた値の約数を返す */
  function divisor(num) {
    var results = [];
    for(var i=1; i<=num; i++) {
      if(num % i == 0) {
        results.push(i);
      }
    }
    return results;
  }
  /** 配列をシャッフルして返す */
  function arrayShuffle(array) {
    for (var i = array.length - 1; i >= 0; i--) {
      var rand = Math.floor( Math.random() * ( i + 1 ) );
      [array[i], array[rand]] = [array[rand], array[i]];
    }
    return array;
  }
  /** リセット用 */
  function reset() {
    hbtns.forEach(function(ele) {
      ele.parentNode.parentNode.removeChild(ele.parentNode);
    });
    wbtns.forEach(function(ele) {
      ele.parentNode.parentNode.removeChild(ele.parentNode);
    });
    hbtns = [];
    wbtns = [];
    widthButtons.style.display = 'none';
    heightButtons.style.display = 'none';
    encryptionDownloadButton.style.display = 'inline';
  }
  var errorBox = document.getElementById('error');
  var errorMessage = document.getElementById('errorMessage');
  var encryption = document.getElementById('encryption');
  var ctxEncryption = encryption.getContext('2d');
  var decryption = document.getElementById('decryption');
  var ctxDecryption = decryption.getContext('2d');
  var encryptionDownloadButton = document.getElementById('encryptionDownloadButton');
  var decryptionDownloadButton = document.getElementById('decryptionDownloadButton');
  var divisionWidth = document.getElementById('division_width');
  var divisionHeight = document.getElementById('division_height');
  var widthButtons = document.getElementById('widthButtons');
  var heightButtons = document.getElementById('heightButtons');
  var wChildBtn = widthButtons.querySelector('label');
  var hChildBtn = heightButtons.querySelector('label');
  var decryptKey = document.getElementById('decryptKey');
  var htmlCode = document.getElementById('htmlCode');
  var jsCode = document.getElementById('jsCode');
  var splitWidht = 0;
  var splitHeight = 0;
  var type = '1';
  var name = '';
  widthButtons.removeChild(wChildBtn);
  heightButtons.removeChild(hChildBtn);
  var wbtns = [];
  var hbtns = [];

  /** 分割指定 */
  document.querySelectorAll('[name=division]').forEach(function(e) {
    e.onchange = function(evt) {
      type = evt.target.value;
    };
  });

  /** 画像パズル化 */
  document.getElementById('file').addEventListener('change', function(e) {
    var file = e.target.files[0];
    e.target.parentNode.querySelector('label').innerText = file.name;
    name = file.name.replace(/^(.*)\..+$/, '$1');
    if(!file.type.match('image.*')) {
      errorBox.style.display = 'block';
      errorMessage.innerText = '対応していないファイル形式です';
      return false;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      reset();
      var img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        errorBox.style.display = 'none';
        var width = splitWidth = encryption.width = img.width;
        var height = splitHeight = encryption.height = img.height;
        if(type === '1' || type === '3') {
          var wDivisor = divisor(width);
          if(wDivisor.length > 2) {
            for(var i = 1; i < wDivisor.length - 1; i++) {
              var copy = wChildBtn.cloneNode(true);
              copy.innerHTML += wDivisor[i];
              copy.children[0].value = wDivisor[i];
              wbtns.push(copy.children[0]);
              widthButtons.appendChild(copy);
            }
            widthButtons.querySelector('label:last-of-type').classList.add('active');
            widthButtons.querySelector('label:last-of-type input').checked = true;
            widthButtons.style.display = 'flex';
            splitWidth = parseInt(wbtns[wbtns.length-1].value);
            wbtns.forEach(function(ele) {
              ele.onchange = function(evt) {
                splitWidth = parseInt(evt.target.value);
                output();
              };
            });
          } else {
            errorBox.style.display = 'block';
            errorMessage.innerText = '縦分割出来ない画像サイズです';
          }
        }
        if(type === '2' || type === '3') {
          var hDivisor = divisor(height);
          if(hDivisor.length > 2) {
            for(var i = 1; i < hDivisor.length - 1; i++) {
              var copy = hChildBtn.cloneNode(true);
              copy.innerHTML += hDivisor[i];
              copy.children[0].value = hDivisor[i];
              hbtns.push(copy.children[0]);
              heightButtons.appendChild(copy);
            }
            heightButtons.querySelector('label:last-of-type').classList.add('active');
            heightButtons.querySelector('label:last-of-type input').checked = true;
            heightButtons.style.display = 'flex';
            splitHeight = parseInt(hbtns[hbtns.length-1].value);
            hbtns.forEach(function(ele) {
              ele.onchange = function(evt) {
                splitHeight = parseInt(evt.target.value);
                output();
              };
            });
          } else {
            errorBox.style.display = 'block';
            errorMessage.innerText = '横分割出来ない画像サイズです';
          }
        }
        function output() {
          var wDivisionCount = width / splitWidth;
          var hDivisionCount = height / splitHeight;
          var numbers = arrayShuffle([...Array(wDivisionCount * hDivisionCount).keys()])
          var shufflePanel = [];
          ctxEncryption.clearRect(0, 0, width, height);
          for(var i = 0; i < hDivisionCount; i++) {
            shufflePanel.push([]);
            for(var j = 0; j < wDivisionCount; j++) {
              var num = numbers[(i * wDivisionCount) + j];
              shufflePanel[i].push([]);
              shufflePanel[i][j] = num;
              ctxEncryption.drawImage(img, ((num % wDivisionCount) * splitWidth), (Math.floor(num / wDivisionCount) * splitHeight), splitWidth, splitHeight, j * splitWidth, i * splitHeight, splitWidth, splitHeight);
            }
          }
          var key = [splitWidth, splitHeight, shufflePanel]
          decryptKey.value = JSON.stringify(key);
          htmlCode.value = '<img id="decryptImg" src="encrypt_'+name+'.png"><canvas id="decryptCanvas" width="' + width + '" height="' + height + '"></canvas>';
          jsCode.value = '(function(w,d,img,c,o,sW,sH,k,ctx,i,j,l,undefined){img=d.getElementById("decryptImg");c=d.getElementById("decryptCanvas");img.onload=function(){o=JSON.parse("'+decryptKey.value+'");sW=o[0];sH=o[1];k=o[2];ctx=c.getContext("2d");for(i=0;i<k.length;i++){for(j=0,l=k[i].length;j<l;j++){ctx.drawImage(img,j*sW,i*sH,sW,sH,((k[i][j]%l)*sW),(~~(k[i][j]/l)*sH),sW,sH);}}img.parentNode.removeChild(img);}}(window,document));';
        }
        output();
      };
    };
    reader.readAsDataURL(file);
  }, {passive: false});

  /** dataURIからBlobに変換して返す */
  function dataURItoBlob(dataURI) {
    var b64 = atob(dataURI.split(',')[1])
    var u8 = Uint8Array.from(b64.split(""), e => e.charCodeAt())
    return new Blob([u8], {type: "image/png"})
  }

  /** 暗号化画像保存ボタン */
  encryptionDownloadButton.addEventListener('click', function() {
    var dataURI = encryption.toDataURL();
    var blob = dataURItoBlob(dataURI);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = 'encrypt_' + name;
    a.href = url;
    a.click();
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, Math.max(3000, 1000 * dataURI.length / 1024 * 1024));
  });

  /** 復号化画像保存ボタン */
  decryptionDownloadButton.addEventListener('click', function() {
    var dataURI = decryption.toDataURL();
    var blob = dataURItoBlob(dataURI);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = 'decrypt_' + name;
    a.href = url;
    a.click();
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, Math.max(3000, 1000 * dataURI.length / 1024 * 1024));
  });

  /** 画像復号化ファイル名表示用 */
  document.getElementById('decryptionFile').addEventListener('change', function(e) {
    e.target.parentNode.querySelector('label').innerText = e.target.files[0].name;
    name = file.name.replace(/^(.*)\..+$/, '$1');
  });

  /** 画像復号化ボタン */
  document.getElementById('decryptionButton').addEventListener('click', function() {
    var file = document.getElementById('decryptionFile').files[0];
    if(!file) {
      errorBox.style.display = 'block';
      errorMessage.innerText = 'ファイルを選択してください';
      return false;
    }
    if(!decryptKey.value) {
      errorBox.style.display = 'block';
      errorMessage.innerText = '画像を復号化するには鍵が必要です';
      return false;
    }
    if(!file.type.match('image.*')) {
      errorBox.style.display = 'block';
      errorMessage.innerText = '対応していないファイル形式です';
      return false;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        errorBox.style.display = 'none';
        decryptionDownloadButton.style.display = 'inline';
        var width = decryption.width = img.width;
        var height = decryption.height = img.height;
        var data, splitWidth, splitHeight, key;
        try {
          data = JSON.parse(decryptKey.value);
          splitWidth = data[0];
          splitHeight = data[1];
          key = data[2];
        } catch (e) {
          errorBox.style.display = 'block';
          errorMessage.innerText = '正しい鍵ではありません';
          return false;
        }
        for(var i = 0, len = key.length; i < len; i++) {
          for(var j = 0, len2 = key[i].length; j < len2; j++) {
            ctxDecryption.drawImage(img, j * splitWidth, i * splitHeight, splitWidth, splitHeight, ((key[i][j] % len2) * splitWidth), (Math.floor(key[i][j] / len2) * splitHeight), splitWidth, splitHeight);
          }
        }
      };
    };
    reader.readAsDataURL(file);
  });
}(window, document));
