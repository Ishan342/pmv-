"""Create a one-time SQL import preserving every original row and original site/status spelling.
Run: python scripts/create-seed.py
Paste the generated supabase/legacy-import.sql into Supabase SQL Editor.
"""
import json
from pathlib import Path
base=Path(__file__).resolve().parent.parent
records=json.loads((base/'scripts'/'legacy-records.json').read_text())
def quote(v):return "'"+str(v if v is not None else '').replace("'","''")+"'"
lines=['-- ONE TIME IMPORT. Existing source_key records are updated, never doubled.', 'begin;']
wc=0;ac=0
for site,shifts in records['manpower'].items():
 for shift,people in shifts.items():
  for i,p in enumerate(people):
   key=f'legacy:{site}:{shift}:{i}'
   values=[key,p.get('id',''),p.get('name',''),p.get('designation',''),site,shift,p.get('status',''),p.get('remarks','')]
   # i keeps layout stable in the source roster
   lines.append('insert into public.manpower(source_key,employee_id,employee_name,designation,site,shift,status,remarks,sort_order) values('+','.join(map(quote,values))+','+str(i)+') on conflict (source_key) do update set employee_id=excluded.employee_id,employee_name=excluded.employee_name,designation=excluded.designation,site=excluded.site,shift=excluded.shift,status=excluded.status,remarks=excluded.remarks,sort_order=excluded.sort_order;')
   wc+=1
for i,row in enumerate(records['assets']):
 row=(row+['']*11)[:11]
 vals=[f'legacy:asset:{i}',row[2],row[1],row[7],row[3],row[4],row[5],row[6],row[8],row[9],row[10]]
 lines.append('insert into public.assets(source_key,asset_code,asset_type,site,model_year,plate_no,manufacturer,chassis_no,asset_status,capacity,serial_no) values('+','.join(map(quote,vals))+') on conflict (source_key) do update set asset_code=excluded.asset_code,asset_type=excluded.asset_type,site=excluded.site,model_year=excluded.model_year,plate_no=excluded.plate_no,manufacturer=excluded.manufacturer,chassis_no=excluded.chassis_no,asset_status=excluded.asset_status,capacity=excluded.capacity,serial_no=excluded.serial_no;')
 ac+=1
lines+=['commit;',f'-- {wc} manpower assignments and {ac} equipment records.']
(base/'supabase'/'legacy-import.sql').write_text('\n'.join(lines)+'\n')
print(wc,ac)
