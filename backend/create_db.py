import pymysql

try:
    conn = pymysql.connect(host='localhost', user='root', password='')
    cursor = conn.cursor()
    cursor.execute('CREATE DATABASE IF NOT EXISTS wildwatch;')
    print("Database wildwatch created or exists.")
    conn.close()
except Exception as e:
    print("Failed with no password:", e)
    try:
        conn = pymysql.connect(host='localhost', user='root', password='password')
        cursor = conn.cursor()
        cursor.execute('CREATE DATABASE IF NOT EXISTS wildwatch;')
        print("Database wildwatch created with password 'password'.")
        conn.close()
    except Exception as e2:
        print("Failed with 'password':", e2)
        try:
            conn = pymysql.connect(host='localhost', user='root', password='your_mysql_password')
            cursor = conn.cursor()
            cursor.execute('CREATE DATABASE IF NOT EXISTS wildwatch;')
            print("Database wildwatch created with password 'your_mysql_password'.")
            conn.close()
        except Exception as e3:
            print("Failed with 'your_mysql_password':", e3)
