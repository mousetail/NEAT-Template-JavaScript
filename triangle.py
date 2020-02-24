width = 320

first_row = [' ' for i in range(width)]
first_row[width // 2] = 'x'


def iterate(row):
    new_row = [' ' for i in row]
    for i in range(1, width - 1):
        t1 = 1 if row[i - 1] == 'x' else (2 if row[i - 1] == 'o' else 0)
        t2 = 1 if row[i + 1] == 'x' else (2 if row[i + 1] == 'o' else 0)

        if t1 == 0 and t2 == 0:
            res = 0
        elif t1 == t2:
            res = 1
        elif t1 == 0 and t2 == 2:
            res = 1
        elif t1 == 0 and t2 == 1:
            res = 2
        elif t1 == 2 and t2 == 0:
            res = 2
        elif t1 == 1 and t2 == 0:
            res = 2
        else:
            res = 0

        if res % 3 == 1:
            new_row[i] = 'x'
        elif res == 2:
            new_row[i] = 'o'
        else:
            new_row[i] = ' '
    return new_row


if __name__ == "__main__":
    row = first_row[:]
    for i in range(width // 2):
        print(''.join(row))
        row = iterate(row)
