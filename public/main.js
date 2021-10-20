var like = document.getElementsByClassName("fa-heart");
var trash = document.getElementsByClassName("fa-trash");

Array.from(like).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.childNodes[9].innerText
        // const msg = this.parentNode.parentNode.childNodes[3].innerText
        const like = parseFloat(this.parentNode.parentNode.childNodes[7].innerText)
        
        fetch('messages/like', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'id': id,
            'like': like,
        
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});



Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        console.log(this.parentNode.parentNode.childNodes[7].innerText)
        const id = this.parentNode.parentNode.childNodes[9].innerText


        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
           "id": id,
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
