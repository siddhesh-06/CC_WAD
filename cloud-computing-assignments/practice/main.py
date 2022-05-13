import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        def recur(n):
            if(n<=1):
                return n
            else:
                return (recur(n-1) + recur(n-2))
        num = 5
        if(num<=0):
            self.response.write("Invalid Number")
        else :
            self.response.write("Fibonacci series :")
            for i in range(num):
                self.response.write(recur(i))

app = webapp2.WSGIApplication([('/',MainPage),],debug=True)