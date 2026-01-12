import threading

class ConcurrentRunner:
    def __init__(self):
        self.results = []

    def run(self, fn, count=2):
        threads = []
        barrier = threading.Barrier(count)

        def wrapped():
            barrier.wait()
            self.results.append(fn())

        for _ in range(count):
            t = threading.Thread(target=wrapped)
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        return self.results
