select u.id, o.id oid, p.id pid from users u
left JOIN orders o
	on o."userId" = u.id
left JOIN payments p
	on p."orderId"= o.id
where u.id = 'user-003'


select u.id, p.id pid from users u
left JOIN payments p
	on p."userId"= u.id
where u.id = 'user-003'


select o.id, p.id pid, u.id u_id from payments p
JOIN orders o
	on p."orderId" = o.id
JOIN users u
	on p."userId"= u.id
where p.id = '499b7e33-fd87-4940-987f-44fde6e3a4bf'


