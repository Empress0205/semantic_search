from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model=SentenceTransformer('all-MiniLM-L6-v2')

sentence1='I love learning artificial intelligence'
sentence2='I enjoy studying AI'
sentence_2 = "The weather is very cold today."
sentence4="How do I make pasta?"
sentence5="What ingredients do I need to cook spaghetti?"

embedding1=model.encode(sentence4)
embedding2=model.encode(sentence5)

similarity=cosine_similarity(
    [embedding1],
    [embedding2]
    
)

print(sentence4)
print(sentence5)
print('Similarity:', similarity[0][0])