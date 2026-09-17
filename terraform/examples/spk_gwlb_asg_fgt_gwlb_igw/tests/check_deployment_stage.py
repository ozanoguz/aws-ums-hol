"""Exercise the actual stage expressions without AWS credentials or providers."""
from pathlib import Path
import shutil
import subprocess
import tempfile

example = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='ums-stage-test-') as directory:
    target = Path(directory)
    shutil.copy(example / 'deployment-stage.tf', target)
    (target / 'inputs.tf').write_text('variable "asgs" { type = any }\n')
    (target / 'tests').mkdir()
    shutil.copy(example / 'tests/deployment-stage.tftest.hcl', target / 'tests')
    subprocess.run(['terraform', 'init', '-backend=false'], cwd=target, check=True)
    subprocess.run(['terraform', 'test'], cwd=target, check=True)
