import urllib.request
import re

urls = [
    "https://raw.githubusercontent.com/readyplayerme/VisemeDemo/main/Assets/ReadyPlayerMe/Examples/Visemes/VisemeExample.cs",
    "https://raw.githubusercontent.com/readyplayerme/rpm-react-sdk/main/README.md",
    "https://raw.githubusercontent.com/readyplayerme/rpm-threejs-example-hub/main/src/main.js"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        links = re.findall(r'https://models\.readyplayer\.me/[a-zA-Z0-9_-]+\.glb', html)
        for link in links:
            print(link)
    except Exception as e:
        pass
