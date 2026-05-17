import psycopg2
conn = psycopg2.connect('postgresql://postgres:12345@localhost:5432/kopianku')
cur = conn.cursor()
try:
    cur.execute('SELECT id, email, role FROM users')
    users = cur.fetchall()
    print('Users:', users)
    owner = next((u for u in users if u[2] == 'owner'), None)
    if owner:
        cur.execute('UPDATE cafe SET owner_id = %s', (owner[0],))
        conn.commit()
        print('Assigned all cafes to owner id', owner[0])
except Exception as e:
    print('Error:', e)
finally:
    cur.close()
    conn.close()
