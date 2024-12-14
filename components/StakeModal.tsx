<div className="text-sm text-gray-500">
  Enter amount of MNT to stake
</div>

<Input 
  placeholder="0.0 MNT"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
/> 