import os
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt

sns.set()
PATH = os.path.abspath(os.getcwd())

data = {
  'date': ['2021-07', '2021-08', '2021-09'],
  'death': [100, 200, 300],
  'recoverd': [300, 450, 100]
}

data = pd.DataFrame.from_dict(data)
data = data.melt('date', var_name='cols',  value_name='vals')
g = sns.lineplot(x="date", y="vals", hue = 'cols', data=data)
sfig = g.get_figure()
sfig.savefig(PATH + '/data/filename.png',  orientation="landscape")


