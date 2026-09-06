-- Update all existing articles to have Dhananjay Singh as the author
UPDATE articles SET author = 'Dhananjay Singh' WHERE author != 'Dhananjay Singh';
